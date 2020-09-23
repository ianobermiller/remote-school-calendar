import React from 'react';
import {Temporal} from 'proposal-temporal';
import {css} from 'emotion';

const CURRENT_TIME = Temporal.Time.from({hour: 9, minute: 45});

const START_TIME = Temporal.Time.from({hour: 8, minute: 0});
const END_TIME = Temporal.Time.from({hour: 14, minute: 30});
const LABEL_STEP = Temporal.Duration.from({minutes: 30});

const CALENDARS_RAW = [
  {
    name: 'Wellington',
    events: [
      {title: 'Homeroom', start: '08:00', end: '10:00'},
      {title: 'PE', start: '10:00', end: '10:30'},
    ],
  },
];

const CALENDARS = CALENDARS_RAW.map(cal => ({
  ...cal,
  events: cal.events.map(ev => ({
    ...ev,
    start: Temporal.Time.from(ev.start),
    end: Temporal.Time.from(ev.end),
  })),
}));

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: 'numeric',
  timeZone: Temporal.now.timeZone(),
});

function App() {
  const rows = [];
  let current = START_TIME;
  while (Temporal.Time.compare(current, END_TIME) <= 0) {
    rows.push(current);
    current = current.plus(LABEL_STEP);
  }

  return (
    <div
      className={css`
        display: grid;
        height: calc(100vh - 80px);
        margin: 40px;
        width: calc(100vw - 80px);
        grid-template-columns: 100px;
        grid-auto-rows: minmax(0, 1fr);
        grid-auto-columns: minmax(0, 1fr);
      `}>
      {rows.map((t, i) => [
        <div
          className={css`
            color: #666;
            font-size: 80%;
            padding-right: 8px;
            text-align: right;
            transform: translateY(-4px);
          `}
          key={`label-${t.toString()}`}
          style={{
            gridColumn: 1,
            gridRow: toGridRow(t),
          }}>
          {timeFormatter.format(t)}
        </div>,
        <div
          className={css`
            border-top: solid 1px #ccc;
          `}
          key={`divider-${t.toString()}`}
          style={{
            gridColumnStart: 2,
            gridColumnEnd: CALENDARS.length + 2,
            gridRow: toGridRow(t),
          }}
        />,
      ])}

      {CALENDARS.map((cal, calIndex) =>
        cal.events.map((ev, evIndex) => (
          <div
            className={css`
              background: #ccc;
              border: solid 1px white;
              border-radius: 4px;
              padding: 4px;
            `}
            key={`calendar-${calIndex}_event-${evIndex}`}
            style={{
              gridColumn: calIndex + 2,
              gridRowStart: toGridRow(ev.start),
              gridRowEnd: toGridRow(ev.end),
            }}>
            {ev.title}
          </div>
        )),
      )}
      <div
        className={css`
          border-top: solid 2px red;
          color: red;
        `}
        style={{
          gridColumnStart: 1,
          gridColumnEnd: CALENDARS.length + 2,
          gridRow: toGridRow(CURRENT_TIME),
        }}>
        {timeFormatter.format(CURRENT_TIME)}
      </div>
    </div>
  );
}

function toGridRow(time) {
  return (
    Math.floor(
      time.difference(START_TIME, {largestUnit: 'minutes'}).minutes / 5,
    ) + 1
  );
}

// eslint-disable-next-line no-unused-vars
function log(value) {
  console.log(value);
  return value;
}

export default App;
