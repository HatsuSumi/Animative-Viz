import React from 'react';
import { Link } from 'react-router-dom';

const AppStatusCard = ({
  tone = 'default',
  eyebrow,
  title,
  description,
  actions,
  homeHref = '/'
}) => {
  const hasCustomActions = Array.isArray(actions) && actions.length > 0;

  return (
    <div className={`app-status-card${tone !== 'default' ? ` ${tone}-state` : ''}`}>
      {eyebrow && <span className="app-status-eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      <p>{description}</p>
      {hasCustomActions && (
        <div className="app-status-actions">
          {actions.map((action) => {
            if (action.type === 'link') {
              return (
                <Link key={action.label} to={action.to} className={`status-button ${action.variant || 'secondary'}`}>
                  {action.label}
                </Link>
              );
            }

            return (
              <button
                key={action.label}
                type="button"
                className={`status-button ${action.variant || 'primary'}`}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      )}
      {!hasCustomActions && homeHref && (
        <div className="app-status-actions">
          <Link to={homeHref} className="status-button secondary">
            返回首页
          </Link>
        </div>
      )}
    </div>
  );
};

export default AppStatusCard;

