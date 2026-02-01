import React from 'react'

const SectionSeparator = ({ text }) => {
  if (!text) return null
  return (
    <div className="dashboard-section-separator">
      <span>{text}</span>
    </div>
  )
}

export default SectionSeparator
