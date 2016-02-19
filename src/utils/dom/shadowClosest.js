export default function shadowClosest(node, selector) {
  do {
    if (node.nodeType === 11) {
      node = node.host;
    }

    if (node.matches(selector)) return node;
  } while (node = node.parentNode);
}
