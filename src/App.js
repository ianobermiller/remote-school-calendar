import React from 'react';
import {Temporal} from 'proposal-temporal';

const CURRENT_TIME = Temporal.Time.from({hour: 9, minute: 45});

const START_TIME = Temporal.Time.from({hour: 8, minute: 0});
const END_TIME = Temporal.Time.from({hour: 14, minute: 30});
const STEP = Temporal.Duration.from({minutes: 30});

const ROW_HEIGHT = 40;

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
    <div className="container">
      {rows.map(t => (
        <div className="row" key={current.toString()}>
          {timeFormatter.format(t)}
        </div>
      ))}

      {CALENDARS.map((cal, i) => (
        <div>
          {cal.events.map((ev, i) => (
            <div
              className="event"
              key={i}
              style={{
                height:
                  (ev.end.difference(ev.start, {largestUnit: 'minutes'})
                    .minutes /
                    STEP.minutes) *
                  ROW_HEIGHT,
                top:
                  (ev.start.difference(START_TIME, {largestUnit: 'minutes'})
                    .minutes /
                    STEP.minutes) *
                  ROW_HEIGHT,
              }}>
              {ev.title}
            </div>
          ))}
        </div>
      ))}
      <div
        className="current"
        style={{
          top:
            (CURRENT_TIME.difference(START_TIME, {largestUnit: 'minutes'})
              .minutes /
              STEP.minutes) *
            ROW_HEIGHT,
        }}
      />

      <style jsx>{`
        .container {
          position: relative;
          margin: 40px;
        }

        .row {
          height: ${ROW_HEIGHT}px;
        }

        .event {
          background: #ccc;
          border: solid 1px white;
          border-radius: 4px;
          padding: 4px;
          position: absolute;
          left: 100px;
          width: 200px;
        }

        .current {
          border: solid 1px red;
          position: absolute;
          left: 100px;
          right: 0;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}

export default App;
