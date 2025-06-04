
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 p-4 md:p-8 z-10">
      <Link to="/" className="inline-block">
        <div className="text-lg font-bold text-contribo-text relative">
          CONTRIBO
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-contribo-gold"></div>
        </div>
      </Link>
    </header>
  );
};

export default Header;
