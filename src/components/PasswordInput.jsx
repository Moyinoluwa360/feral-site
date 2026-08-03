import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

/**
 * A password <input> with a show/hide toggle. Accepts the same props as a
 * plain <input> (value, onChange, placeholder, autoComplete, etc.) — just
 * omit `type`, it's always password/text depending on visibility.
 */
const PasswordInput = ({ className = '', ...props }) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`${className} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <FiEyeOff size={16} /> : <FiEye size={16} />}
      </button>
    </div>
  )
}

export default PasswordInput
