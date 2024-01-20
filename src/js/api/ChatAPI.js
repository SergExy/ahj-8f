import Entity from './Entity';
import createRequest from './createRequest';

export default class ChatAPI extends Entity {
  constructor() {
    super();
    this.host = 'http://localhost:3000';
  }

  async registry(data) {
    const options = {
      url: `${this.host}/new-user`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data,
    };
    const res = await createRequest(options);
    return res;
  }
}
