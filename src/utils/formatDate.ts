/**
 * return a Date with the format: YY/MM/DD HH:MM:SS
 *
 * @param date an Date Object
 *
 * @returns format Date String
 */

export const formatDate = (date: Date) => {
  const month =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
  const min =
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  const second =
    date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
  return `${date.getFullYear()}/${month}/${day} ${hour}:${min}:${second}`;
};
