import React from 'react';
import {Temporal} from 'proposal-temporal';
import {css} from 'emotion';

const CURRENT_TIME = Temporal.Time.from({hour: 9, minute: 45});

const START_TIME = Temporal.Time.from({hour: 8, minute: 0});
const END_TIME = Temporal.Time.from({hour: 14, minute: 30});
const STEP = Temporal.Duration.from({minutes: 30});

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
    current = current.plus(STEP);
  }

  return (
    <div
      className={css`
        display: grid;
        height: calc(100vh - 80px);
        margin: 40px;
        width: calc(100vw - 80px);
        grid-template-columns: 100px;
        grid-auto-rows: 1fr;
        grid-auto-columns: 1fr;
      `}>
      {rows.map(t => (
        <>
          <div
            className={css`
              padding-right: 8px;
              text-align: right;
              transform: translateY(-50%);
            `}
            key={`label-${t.toString()}`}
            style={{
              gridColumn: 1,
              gridRow: toGridRow(t),
            }}>
            {timeFormatter.format(t)}
          </div>
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
          />
        </>
      ))}

      {CALENDARS.map((cal, calIndex) =>
        cal.events.map((ev, i) => (
          <div
            className={css`
              background: #ccc;
              border: solid 1px white;
              border-radius: 4px;
              padding: 4px;
            `}
            key={i}
            style={{
              gridColumn: calIndex + 2,
              gridRowStart: log(toGridRow(ev.start)),
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
          gridRow: Math.floor(
            CURRENT_TIME.difference(START_TIME, {largestUnit: 'minutes'})
              .minutes / 5,
          ),
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

function log(value) {
  console.log(value);
  return value;
}

export default App;
