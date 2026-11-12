/** Wraps every Markdown table in a scrollable, keyboard-focusable region. */
export default function rehypeTableWrap() {
  return (tree) => {
    const walk = (node) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        if (child.type === 'element' && child.tagName === 'table') {
          return {
            type: 'element',
            tagName: 'div',
            properties: { className: ['table-wrap'], tabIndex: 0, role: 'region', ariaLabel: 'Comparison table (scrolls sideways on small screens)' },
            children: [child],
          };
        }
        walk(child);
        return child;
      });
    };
    walk(tree);
  };
}
