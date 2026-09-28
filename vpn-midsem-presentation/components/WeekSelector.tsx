'use client';

import {
  Children,
  Fragment,
  isValidElement,
  useState,
  type ReactNode,
} from 'react';
import Deck from '@/deck/Deck';

type Week = 'week1' | 'week2' | 'week3' | 'week4';

function flattenSlides(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) => {
    if (isValidElement(child) && child.type === Fragment) {
      return flattenSlides((child.props as { children?: ReactNode }).children);
    }
    return [child];
  });
}

export default function WeekSelector({
  weekOne,
  weekTwo,
  weekThree,
  weekFour,
}: {
  weekOne: ReactNode;
  weekTwo: ReactNode;
  weekThree: ReactNode;
  weekFour?: ReactNode;
}) {
  const [activeWeek, setActiveWeek] = useState<Week>('week4');

  return (
    <>
      <div className="week-selector" role="tablist" aria-label="Select presentation week">
        <span className="week-selector-label">Data presentation</span>
        <div className="week-selector-tabs">
          {(['week1', 'week2', 'week3', 'week4'] as const).map((week) => (
            <button
              key={week}
              type="button"
              role="tab"
              aria-selected={activeWeek === week}
              className={`week-selector-tab${activeWeek === week ? ' active' : ''}`}
              onClick={() => setActiveWeek(week)}
            >
              {week === 'week1'
                ? 'Week 1'
                : week === 'week2'
                  ? 'Week 2'
                  : week === 'week3'
                    ? 'Week 3'
                    : '5-Layer Architecture'}
            </button>
          ))}
        </div>
      </div>

      <Deck key={activeWeek}>
        {flattenSlides(
          activeWeek === 'week1'
            ? weekOne
            : activeWeek === 'week2'
              ? weekTwo
              : activeWeek === 'week3'
                ? weekThree
                : weekFour || weekThree
        )}
      </Deck>
    </>
  );
}
