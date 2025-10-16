import React from 'react';

const HeaderTitle = ({ children, className = "mb-0" }) => {
  return <h6 className={className}>{children}</h6>;
};

export default HeaderTitle;
