import logo from "../../assets/Logo.png";

type Props = {
  size?: number;
  showText?: boolean;
};

export default function Logo({ size = 40, showText = true }: Props) {
  return (
    <div className="flex items-center gap-3 animate-[breath_6s_ease-in-out_infinite]">
      <img
        src={logo}
        alt="DreamSync logo"
        style={{ width: size, height: size }}
        className="object-contain"
      />

      {showText && (
        <span className="font-serif text-xl tracking-wide">
          DreamSync
        </span>
      )}
    </div>
  );
}
