const range = document.createRange();

export default function parse(str, {
  context = document.body
}={}) {
  range.selectNode(context);
  return range.createContextualFragment(str);
}
