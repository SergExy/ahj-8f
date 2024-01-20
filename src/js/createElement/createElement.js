function createElement(options) {
  const {
    name,
    id,
    classes,
    text,
    attributes,
  } = options;

  const element = document.createElement(name);

  if (id) {
    element.id = id;
  }

  if (classes) {
    classes.forEach((className) => {
      element.classList.add(className[0] === '.' ? className.replace(/^\./, '') : className);
    });
  }

  if (text) {
    element.textContent = text;
  }

  if (attributes) {
    attributes.forEach((attr) => {
      element.setAttribute(attr.name, attr.value);
    });
  }

  return element;
}

export default createElement;
