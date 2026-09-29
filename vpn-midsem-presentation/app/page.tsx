import Deck from '@/deck/Deck';
import Slide from '@/deck/Slide';
import { presentationSlides } from '@/data/presentation-store';
import './midsem.css';

function ImageSpace({ index }: { index: number }) {
  return (
    <div
      className={`ms-image-space ms-image-space-${index + 1}`}
      aria-label={`Image space ${index + 1}`}
    />
  );
}

export default function Home() {
  return (
    <Deck>
      {presentationSlides.map((item, index) => (
        <Slide
          key={`${item.presenter}-${item.title}`}
          nav={item.title}
          notes={item.brief}
          className={`ms-slide ms-owner-${item.presenter.toLowerCase()}`}
        >
          <div className="ms-template">
            <header className="ms-template-header">
              <div className="ms-kicker">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span className="ms-kicker-dot" />
                <span>{item.presenter}</span>
              </div>
              <h2>{item.title}</h2>
            </header>

            <div className="ms-image-grid">
              {Array.from({ length: item.imageSlots }, (_, slotIndex) => (
                <ImageSpace key={slotIndex} index={slotIndex} />
              ))}
            </div>
          </div>
        </Slide>
      ))}
    </Deck>
  );
}
