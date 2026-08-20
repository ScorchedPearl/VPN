'use client';

import {
  Children,
  Fragment,
  isValidElement,
  useState,
  type ReactNode,
} from 'react';
import Deck from '@/deck/Deck';

type Week = 'week1' | 'week2';

function flattenSlides(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) => {
    if (isValidElement(child) && child.type === Fragment) {
      return flattenSlides(child.props.children);
    }
    return [child];
  });
}

export default function WeekSelector({
  weekOne,
  weekTwo,
}: {
  weekOne: ReactNode;
  weekTwo: ReactNode;
}) {
  const [activeWeek, setActiveWeek] = useState<Week>('week1');

  return (
    <>
      <div className="week-selector" role="tablist" aria-label="Select presentation week">
        <span className="week-selector-label">Data presentation</span>
        <div className="week-selector-tabs">
          {(['week1', 'week2'] as const).map((week) => (
            <button
              key={week}
              type="button"
              role="tab"
              aria-selected={activeWeek === week}
              className={`week-selector-tab${activeWeek === week ? ' active' : ''}`}
              onClick={() => setActiveWeek(week)}
            >
              {week === 'week1' ? 'Week 1' : 'Week 2'}
            </button>
          ))}
        </div>
      </div>

      <Deck key={activeWeek}>
        {flattenSlides(activeWeek === 'week1' ? weekOne : weekTwo)}
      </Deck>
    </>
  );
}
