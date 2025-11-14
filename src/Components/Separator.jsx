import '../Style/Separator.scss';

export default function Separator({ index = 0 }) {
  return (
    <>
      <div
        key={index}
        className={`separation ${index === 0 ? 'first' : 'other'}`}
      ></div>
    </>
  );
}
