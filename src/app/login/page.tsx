"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import SenyasBot from '@/components/ui/SenyasBot';

import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaApple } from "react-icons/fa";

export default function LoginPage() {
  const [isLight, setIsLight] = useState(false);
  const router = useRouter();

  return (
    <main className={`${styles.loginWrapper} ${isLight ? styles.light : ""}`}>
      <button
        className={styles.btnTheme}
        onClick={() => setIsLight(!isLight)}
        type="button"
        aria-label="Toggle theme"
      >
        {isLight ? "🌙" : "🌸"}
      </button>

      <section className={styles.container}>
        <div className={styles.leftPanel}>
          <div className={styles.formShell}>
            <div className={`${styles.brand} ${styles.animateSlideUp}`}>
              <div className={styles.brandIcon}>◆</div>
              <span>Senyas.IO</span>
            </div>

            <div className={`${styles.header} ${styles.animateSlideUp} ${styles.delay1}`}>
              <h1>Welcome</h1>
              <p>
                Sign in to continue using Senyas.IO and access seamless
                communication tools.
              </p>
            </div>

            <form className={styles.form}>
              <div className={`${styles.fieldGroup} ${styles.animateSlideUp} ${styles.delay2}`}>
                <label>Email Address</label>
                <input
                  className={styles.inputField}
                  type="email"
                  placeholder="name@company.com"
                />
              </div>

              <div className={`${styles.fieldGroup} ${styles.animateSlideUp} ${styles.delay3}`}>
                <div className={styles.passwordRow}>
                  <label>Password</label>
                  <a href="#">Forgot password?</a>
                </div>

                <input
                  className={styles.inputField}
                  type="password"
                  placeholder="••••••••"
                />
              </div>

              <button
                className={`${styles.btnContinue} ${styles.animateSlideUp} ${styles.delay4}`}
                type="button"
              >
                Continue <span>→</span>
              </button>

              <button
                className={`${styles.btnGuest} ${styles.animateSlideUp} ${styles.delay5}`}
                type="button"
                onClick={() => router.push('/translator')}
              >
                Continue as Guest
              </button>
            </form>

            <div className={`${styles.bottomLogin} ${styles.animateSlideUp} ${styles.delay6}`}>
              <div className={styles.divider}>
                <span></span>
                <p>or continue with</p>
                <span></span>
              </div>

              <div className={styles.socialRow}>
                <button
                  className={styles.btnSocial}
                  type="button"
                  aria-label="Continue with Google"
                >
                  <FcGoogle className={styles.socialIcon} />
                </button>

                <button
                  className={styles.btnSocial}
                  type="button"
                  aria-label="Continue with Facebook"
                >
                  <FaFacebookF
                    className={`${styles.socialIcon} ${styles.facebookIcon}`}
                  />
                </button>

                <button
                  className={styles.btnSocial}
                  type="button"
                  aria-label="Continue with Apple"
                >
                  <FaApple className={styles.socialIcon} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightPanel} style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '40px',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <SenyasBot size={320} />
          </div>
          <div className={styles.movingGrid}></div>
          <div className={styles.noiseOverlay}></div>
          <div className={styles.rightGlow}></div>

          <div className={`${styles.blob} ${styles.blob1}`}></div>
          <div className={`${styles.blob} ${styles.blob2}`}></div>
          <div className={`${styles.blob} ${styles.blob3}`}></div>

          <div className={styles.floatingHandOne}>☝</div>
          <div className={styles.floatingHandTwo}>✋</div>

          <div className={`${styles.visualCard} ${styles.animateFadeScale} ${styles.delayRight}`}>
            <div className={styles.cardIcon}>💬</div>

            <h2>
              Breaking communication <span>barriers</span>
            </h2>

            <p>
              Real-time sign language translation that turns gestures into words
              instantly.
            </p>

            <div className={styles.waveform}>
              {Array.from({ length: 18 }).map((_, index) => (
                <span
                  key={index}
                  className={styles.waveBar}
                  style={{ animationDelay: `${index * 0.06}s` }}
                />
              ))}
            </div>

            <blockquote>“Connect without limits.”</blockquote>
          </div>
        </div>
      </section>
    </main>
  );
}