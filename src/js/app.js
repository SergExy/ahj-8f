import Chat from './Chat';
import createElement from './createElement/createElement';

const root = document.getElementById('root');
const container = createElement({
  name: 'div',
  classes: ['container'],
});
root.appendChild(container);
const app = new Chat(container);

app.init();
