const createRequest = async (options) => {
  const {
    url,
    method,
    headers,
    data,
  } = options;

  const res = await fetch(url, {
    method: method || 'GET',
    headers: headers || {},
    body: data || null,
  });

  const result = await res.json();
  return result;
};

export default createRequest;
