export default (value) => {
  const date = new Date(value)
  return date.toLocaleDateString(['pt-BR'], {year: 'numeric', month: '2-digit', day: '2-digit'})
}
