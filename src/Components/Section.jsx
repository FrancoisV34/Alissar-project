import Button from '../Components/Button.jsx';
import Data from '../Data/data.json';
import Telephone from '../Components/Telephone.jsx';
import Separator from './Separator.jsx';

export default function Section() {
  return (
    <>
      {Data.map((data, index) =>
        data.content && Array.isArray(data.content) ? (
          <section
            className={`presentation ${
              index % 2 === 0 ? 'normal' : 'reverse'
            } ${index === 0 ? 'first' : 'other'}`}
            key={index}
            id={data.idlink}
          >
            <div className="text-pres">
              <h2 className="title-pres">{data.title}</h2>
              <Separator index={index} />

              {data.content.map((contentBlock, blockIndex) => (
                <div className="content-block" key={blockIndex}>
                  {Object.entries(contentBlock).map(([key, text]) => (
                    <p className="presentation-text" key={key}>
                      {text}
                    </p>
                  ))}
                </div>
              ))}

              <div className="rdv-tel">
                <Button />
                <Telephone />
              </div>
            </div>
            <div className="img-pres">
              <img src={data.image} alt={data.title} className="selfie" />
            </div>
          </section>
        ) : null
      )}
    </>
  );
}
