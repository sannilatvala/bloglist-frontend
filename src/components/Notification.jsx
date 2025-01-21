const Notification = ({ message, type = 'default' }) => {
  if (!message) return null

  return <div className={`notification ${type}`}>{message}</div>
}

export default Notification