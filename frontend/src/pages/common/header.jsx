import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.line}></span>
        <div className={styles.logoIcon}>X</div>
        <h1 className={styles.brandName}>
          Print<span>Caffe</span>
        </h1>
        <span className={styles.line}></span>
      </div>
    </header>
  );
};

export default Header;