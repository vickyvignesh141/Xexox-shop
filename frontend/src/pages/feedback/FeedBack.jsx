import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './feedback.module.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_DESCRIPTION_LENGTH = 500;

/* ============================================
   Feedback form — render this on the /feedback route
============================================ */
export default function FeedbackForm({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Enter your email so the team can follow up.';
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!description.trim()) {
      nextErrors.description = 'Tell us a bit about your feedback.';
    } else if (description.trim().length < 10) {
      nextErrors.description = 'A few more details would help us understand.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({ email: email.trim(), description: description.trim() });
      }
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setEmail('');
    setDescription('');
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <div className={styles.container}>
      {isSubmitted ? (
        <div className={styles.form}>
          <div className={styles.successState}>
            <svg
              className={styles.successIcon}
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
              <path
                d="M15 24.5L21 30.5L33 17.5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className={styles.successTitle}>Thanks for the note</h2>
            <p className={styles.successText}>
              Your feedback is on its way to the team. We'll reach out at{' '}
              {email || 'your email'} if we need anything else.
            </p>
            {/* <button type="button" className={styles.resetLink} onClick={handleReset}>
              Send more feedback
            </button> */}
          </div>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <h1> Built by PathFinders</h1>
          <p className={styles.subtitle}>Built by the team — tell us what's working.</p>

          <div className={styles.field}>
            <label htmlFor="feedback-email" className={styles.visuallyHidden}>
              Email
            </label>
            <input
              id="feedback-email"
              type="email"
              placeholder="Your email"
              className={errors.email ? styles.inputError : ''}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'feedback-email-error' : undefined}
            />
            {errors.email && (
              <span id="feedback-email-error" className={styles.errorText}>
                {errors.email}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="feedback-description" className={styles.visuallyHidden}>
              Feedback
            </label>
            <textarea
              id="feedback-description"
              placeholder="Share your feedback..."
              className={errors.description ? styles.inputError : ''}
              value={description}
              maxLength={MAX_DESCRIPTION_LENGTH}
              onChange={(e) => setDescription(e.target.value)}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'feedback-description-error' : undefined}
            />
            {errors.description ? (
              <span id="feedback-description-error" className={styles.errorText}>
                {errors.description}
              </span>
            ) : (
              <span className={styles.charCount}>
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            )}
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send feedback'}
          </button>
        </form>
      )}
    </div>
  );
}

/* ============================================
   Floating feedback button — render this once in App.jsx,
   outside <Routes>, so it shows on every page except /feedback.
============================================ */
export function FeedbackButton() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === '/feedback') {
    return null;
  }

  return (
    <button
      type="button"
      className={styles.feedbackButton}
      onClick={() => navigate('/feedback')}
      aria-label="Give feedback"
    >
      Feedback
    </button>
  );
}