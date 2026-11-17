<?php
/**
 * Deadbolt Fixers form handler (runs on Hostinger PHP, no third-party service).
 * Both site forms (ContactForm, QuickForm) POST here via fetch (see FormScript.astro).
 *
 * Owner rule 2026-11-17: every submission is emailed to ben3n4456@gmail.com.
 * FROM_EMAIL should be a real mailbox on the domain (create it in hPanel > Emails) so Gmail
 * trusts the message; Reply-To is set to the customer's email when they gave one.
 *
 * Protection: POST only, same-site Origin/Referer, honeypot field "company",
 * required-field validation, header-injection stripping and a per-IP rate limit.
 */

const TO_EMAIL   = 'ben3n4456@gmail.com';
const FROM_EMAIL = 'forms@deadboltfixers.com';
const FROM_NAME  = 'Deadbolt Fixers Website';
const SITE_HOST  = 'deadboltfixers.com';
const RATE_MAX   = 5;    // submissions
const RATE_SECS  = 600;  // per 10 minutes per IP

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

function reply(int $code, array $data): void {
  http_response_code($code);
  echo json_encode($data);
  exit;
}
function clean(string $v, int $max = 2000): string {
  $v = trim(str_replace("\0", '', $v));
  return function_exists('mb_substr') ? mb_substr($v, 0, $max) : substr($v, 0, $max);
}
function oneLine(string $v): string {
  return trim(preg_replace('/[\r\n\t]+/', ' ', $v));
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') reply(405, ['ok' => false, 'error' => 'method']);

// Same-site check: the request must come from a page on this domain.
$src = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
$srcHost = strtolower((string) parse_url($src, PHP_URL_HOST));
if ($srcHost !== SITE_HOST && $srcHost !== 'www.' . SITE_HOST) reply(403, ['ok' => false, 'error' => 'origin']);

// Honeypot: bots fill the hidden "company" field. Pretend success, send nothing.
if (!empty($_POST['company'])) reply(200, ['ok' => true]);

// Rate limit per IP (files in the system temp dir, outside the web root).
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = sys_get_temp_dir() . '/df_form_' . md5($ip);
$now = time();
$hits = [];
if (is_file($rateFile)) {
  $hits = array_filter(array_map('intval', explode(',', (string) @file_get_contents($rateFile))), fn($t) => $t > $now - RATE_SECS);
}
if (count($hits) >= RATE_MAX) reply(429, ['ok' => false, 'error' => 'rate']);

// Validate.
$name    = oneLine(clean((string) ($_POST['name'] ?? ''), 120));
$phone   = oneLine(clean((string) ($_POST['phone'] ?? ''), 40));
$email   = oneLine(clean((string) ($_POST['email'] ?? ''), 200));
$service = oneLine(clean((string) ($_POST['service'] ?? ''), 120));
if ($name === '' || $service === '' || strlen(preg_replace('/\D/', '', $phone)) < 10) reply(422, ['ok' => false, 'error' => 'fields']);
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) reply(422, ['ok' => false, 'error' => 'email']);

// Build the message: known fields first, then every other submitted field (lead source etc.).
$labels = [
  'name' => 'Name', 'phone' => 'Phone', 'email' => 'Email', 'service' => 'Service', 'zip' => 'ZIP code',
  'contact_method' => 'Reply by', 'message' => 'Message', 'form_name' => 'Form', 'page_url' => 'Sent from page',
  'page_title' => 'Page title', 'landing_page' => 'First page of visit', 'referrer' => 'Referrer',
];
$skip = ['company', '_subject'];
$lines = [];
foreach ($labels as $key => $label) {
  $val = clean((string) ($_POST[$key] ?? ''), $key === 'message' ? 5000 : 500);
  if ($val !== '') $lines[] = $label . ': ' . ($key === 'message' ? "\n" . $val : $val);
}
foreach ($_POST as $key => $val) {
  if (isset($labels[$key]) || in_array($key, $skip, true) || !is_string($val)) continue;
  $val = clean($val, 500);
  if ($val !== '') $lines[] = oneLine(clean((string) $key, 40)) . ': ' . $val;
}
$lines[] = '';
$lines[] = 'IP: ' . $ip;
$lines[] = 'Received: ' . gmdate('Y-m-d H:i') . ' UTC';
$body = implode("\n", $lines);

$form = oneLine(clean((string) ($_POST['form_name'] ?? 'form'), 40));
$subject = 'New Deadbolt Fixers lead: ' . $service . ' (' . $name . ', ' . $form . ')';
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

$headers = [
  'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>',
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'Content-Transfer-Encoding: 8bit',
  'X-Mailer: DeadboltFixers-Form',
];
if ($email !== '') $headers[] = 'Reply-To: ' . $email;

$sent = @mail(TO_EMAIL, $encodedSubject, $body, implode("\r\n", $headers), '-f' . FROM_EMAIL);
if (!$sent) reply(500, ['ok' => false, 'error' => 'mail']);

$hits[] = $now;
@file_put_contents($rateFile, implode(',', $hits), LOCK_EX);
reply(200, ['ok' => true]);
