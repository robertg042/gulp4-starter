const sayHi = function(name, page) {
  const greeting = `Hi, ${name}! Page '${page}' is working!`
  console.log(`%c ${greeting}`,"background-color: #000000; color: #ffffff; padding: 3px 8px 3px 8px;")
  const greetingElement = document.querySelector('.greeting');
  if (greetingElement) {
    greetingElement.textContent = greeting;
  }
};
const id = id => document.getElementById(id);
const qs = sel => document.querySelector(sel);
const qsa = sel => [].slice.call(document.querySelectorAll(sel));
