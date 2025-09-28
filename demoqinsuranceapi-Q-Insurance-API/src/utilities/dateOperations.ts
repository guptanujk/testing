const getCurrentDateTime = () => {
  const d = new Date();
  const dformat =
    [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-') +
    ' ' +
    [d.getHours(), d.getMinutes(), d.getSeconds()].join(':');
  return dformat;
};

export {
  getCurrentDateTime,
};
