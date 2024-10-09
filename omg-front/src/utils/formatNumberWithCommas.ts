export default function formatNumberWithCommas(number: number | undefined) {
  if (!number) {
    return 0;
  }
  return number.toLocaleString();
}
