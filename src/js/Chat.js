import ChatAPI from './api/ChatAPI';
import createElement from './createElement/createElement';

export default class Chat {
  constructor(container) {
    this.container = container;
    this.api = new ChatAPI();
    this.ws = null;
  }

  init() {
    this.bindToDOM();
    this.registerEvents();
  }

  bindToDOM() {
    this.chatEl = createElement({
      name: 'div',
      classes: ['chat'],
    });
    const headerEl = createElement({
      name: 'div',
      classes: ['chat__header'],
      text: 'Chat',
    });
    this.chatEl.appendChild(headerEl);
    const connectEl = createElement({
      name: 'div',
      classes: ['chat__connect'],
      text: 'disconnect',
    });
    connectEl.onclick = this.disconnect;
    this.chatEl.appendChild(connectEl);

    const chatContainerEl = createElement({
      name: 'div',
      classes: ['chat__container'],
    });

    const userListEl = createElement({
      name: 'div',
      classes: ['chat__userlist'],
    });
    chatContainerEl.appendChild(userListEl);

    const areaEl = createElement({
      name: 'div',
      classes: ['chat__area'],
    });
    const messagesContainerEl = createElement({
      name: 'div',
      classes: ['chat__messages-container'],
    });
    areaEl.appendChild(messagesContainerEl);

    const messageInputEl = createElement({
      name: 'div',
      classes: ['chat__messages-input'],
    });
    const formEl = createElement({
      name: 'form',
      classes: ['form'],
    });
    const formGroupEl = createElement({
      name: 'div',
      classes: ['form__group'],
    });
    const inputEl = createElement({
      name: 'input',
      classes: ['form__input'],
      attributes: [
        { name: 'name', value: 'message' },
        { name: 'placeholder', value: 'Type your message here' },
      ],
    });
    formGroupEl.appendChild(inputEl);
    formEl.appendChild(formGroupEl);
    formEl.onsubmit = this.sendMessage;

    messageInputEl.appendChild(formEl);
    areaEl.appendChild(messageInputEl);

    chatContainerEl.appendChild(areaEl);

    this.chatEl.appendChild(chatContainerEl);
    this.container.appendChild(this.chatEl);
  }

  registerEvents() {
    const modalFormEl = createElement({
      name: 'div',
      classes: ['modal__form', 'active'],
    });
    const modalBackgroundEl = createElement({
      name: 'div',
      classes: ['modal__background'],
    });
    modalFormEl.appendChild(modalBackgroundEl);

    const contentEl = createElement({
      name: 'div',
      classes: ['modal__content'],
    });
    const contentHeaderEl = createElement({
      name: 'div',
      classes: ['modal__header'],
      text: 'Выберите псевдоним',
    });
    contentEl.appendChild(contentHeaderEl);

    const contentBodyEl = createElement({
      name: 'div',
      classes: ['modal__body'],
    });
    const formEl = createElement({
      name: 'form',
      classes: ['form'],
    });
    const formGroupEl = createElement({
      name: 'div',
      classes: ['form__group'],
    });
    const labelEl = createElement({
      name: 'label',
      classes: ['form__label'],
    });
    formGroupEl.appendChild(labelEl);
    const inputEl = createElement({
      name: 'input',
      classes: ['form__input'],
      attributes: [
        { name: 'name', value: 'name' },
      ],
    });
    formGroupEl.appendChild(inputEl);
    inputEl.oninput = () => {
      const hint = formGroupEl.querySelector('.form__hint');
      if (!hint) return;
      hint.remove();
    };

    formEl.appendChild(formGroupEl);
    const submitEl = createElement({
      name: 'button',
      classes: ['form__submit'],
      text: 'Прдолжить',
    });
    formEl.appendChild(submitEl);

    formEl.onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const name = formData.get('name');
      const data = {
        name,
      };
      const registry = await this.api.registry(JSON.stringify(data));
      if (registry.status === 'error') {
        const hint = formGroupEl.querySelector('.form__hint');
        if (hint) return;

        const hintEl = createElement({
          name: 'div',
          classes: ['form__hint'],
          text: registry.message,
        });
        formGroupEl.appendChild(hintEl);
      } else {
        const { user } = registry;
        this.user = user;
        modalFormEl.remove();
        this.subscribeOnEvents();
      }
    };

    contentBodyEl.appendChild(formEl);
    contentEl.appendChild(contentBodyEl);

    modalFormEl.appendChild(contentEl);
    document.querySelector('body').appendChild(modalFormEl);
  }

  subscribeOnEvents() {
    this.ws = new WebSocket('wss://ahj-8.onrender.com/connection');
    this.ws.addEventListener('open', this.onOpen);
    this.ws.addEventListener('close', this.onClose);
    this.ws.addEventListener('error', this.onError);
    this.ws.addEventListener('message', this.onMessage);
  }

  onOpen = () => {
    // eslint-disable-next-line no-console
    console.log(this.user.name);
  };

  onClose = () => {
    this.disconnect();
  };

  onError = () => {
    this.disconnect();
  };

  onMessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === 'send') {
      this.renderMessage(data);
      return;
    }
    this.onEnterChatHandler(data);
  };

  disconnect = () => {
    const data = {
      user: this.user,
      type: 'exit',
    };
    this.ws.send(JSON.stringify(data));
    this.ws.removeEventListener('open', this.onOpen);
    this.ws.removeEventListener('close', this.onClose);
    this.ws.removeEventListener('error', this.onError);
    this.ws.removeEventListener('message', this.onMessage);
    this.ws = null;
    this.chatEl.remove();
    this.init();
  };

  onEnterChatHandler(users) {
    const userListEl = this.container.querySelector('.chat__userlist');
    userListEl.innerHTML = '';
    users.forEach((user) => {
      const userEl = createElement({
        name: 'div',
        classes: ['chat__user'],
        text: user.name,
      });
      userListEl.appendChild(userEl);
    });
  }

  sendMessage = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const msgText = formData.get('message');
    const message = {
      user: this.user,
      type: 'send',
      message: msgText,
    };

    this.ws.send(JSON.stringify(message));

    e.target.reset();
  };

  renderMessage(msg) {
    const { user, message: msText } = msg;
    const messageEl = createElement({
      name: 'div',
      classes: [
        'message__container',
        `${this.user.name === user.name ? 'message__container-yourself' : 'message__container-interlocutor'}`,
      ],
    });
    const headerEl = createElement({
      name: 'div',
      classes: ['message__header'],
      text: `${this.user.name === user.name ? 'You' : user.name}`,
    });
    messageEl.appendChild(headerEl);

    const textEl = createElement({
      name: 'p',
      text: msText,
    });
    messageEl.appendChild(textEl);

    const msContainer = this.container.querySelector('.chat__messages-container');
    msContainer.appendChild(messageEl);
  }
}
