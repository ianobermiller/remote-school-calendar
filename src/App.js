import React, {useEffect, useState} from 'react';
import {Temporal} from 'proposal-temporal';
import {css} from 'emotion';

const START_TIME = Temporal.Time.from({hour: 8, minute: 30});
const END_TIME = Temporal.Time.from({hour: 14, minute: 30});
const LABEL_STEP = Temporal.Duration.from({minutes: 30});

const CALENDARS_RAW = [
  {
    name: 'Adaira',
    color: 'rgb(220 130 18)',
    eventsByDay: [
      // Monday
      [
        {title: 'Class Meeting', start: '08:30'},
        {title: 'Art / PE / Music', start: '09:00'},
        {title: 'Reading - Seesaw', start: '09:30'},
        {title: 'ELA Group 2', start: '10:00'},
        {title: 'Break', start: '10:30'},
        {title: 'Math - Seesaw', start: '11:00'},
        {title: 'Lunch', start: '11:30'},
        {title: 'Math - Group 2', start: '12:15'},
        {title: 'Break', start: '12:45'},
        {title: 'Science / Social Studies', start: '13:00'},
      ],
      // Tuesday
      [
        {title: 'Class Meeting', start: '08:30'},
        {title: 'Art / PE / Music', start: '09:00'},
        {title: 'Reading - Seesaw', start: '09:30'},
        {title: 'ELA Group 2', start: '10:00'},
        {title: 'Break', start: '10:30'},
        {title: 'Math - Seesaw', start: '11:00'},
        {title: 'Lunch', start: '11:30'},
        {title: 'Math - Group 2', start: '12:15'},
        {title: 'Break', start: '12:45'},
        {title: 'Science / Social Studies', start: '13:00'},
      ],
      // Wednesday
      [
        {title: 'Class Meeting', start: '08:30'},
        {title: 'Art / PE / Music', start: '09:00'},
        {title: 'Reading - Live', start: '09:30'},
        {title: 'Break', start: '10:00'},
        {title: 'Math', start: '10:15'},
        {title: 'Break', start: '10:45'},
        {title: 'Science / Social Studies', start: '11:00'},
        {title: 'Lunch', start: '11:30', end: '12:15'},
      ],
      // Thursday
      [
        {title: 'Class Meeting', start: '08:30'},
        {title: 'Art / PE / Music', start: '09:00'},
        {title: 'Reading - Seesaw', start: '09:30'},
        {title: 'ELA Group 2', start: '10:00'},
        {title: 'Break', start: '10:30'},
        {title: 'Math - Seesaw', start: '11:00'},
        {title: 'Lunch', start: '11:30'},
        {title: 'Math - Group 2', start: '12:15'},
        {title: 'Break', start: '12:45'},
        {title: 'Science / Social Studies', start: '13:00'},
      ],
      // Friday
      [
        {title: 'Class Meeting', start: '08:30'},
        {title: 'Art / PE / Music', start: '09:00'},
        {title: 'Reading - Seesaw', start: '09:30'},
        {title: 'ELA Group 2', start: '10:00'},
        {title: 'Break', start: '10:30'},
        {title: 'Math - Seesaw', start: '11:00'},
        {title: 'Lunch', start: '11:30'},
        {title: 'Math - Group 2', start: '12:15'},
        {title: 'Break', start: '12:45'},
        {title: 'Science / Social Studies', start: '13:00'},
      ],
    ],
  },
  {
    name: 'Isla',
    color: 'rgb(181 63 172)',
    eventsByDay: [
      // Monday
      [
        {title: 'Welcome / SEL', start: '08:30'},
        {title: 'Writing', start: '09:00'},
        {title: 'Math', start: '09:45'},
        {title: 'Break', start: '10:30'},
        {title: 'PE - Live', start: '11:00'},
        {title: 'Reading', start: '11:30'},
        {title: 'Lunch', start: '12:00'},
        {title: 'Science / Social Studies', start: '12:45', end: '13:15'},
        // {
        //   title: 'Independent Work / Small Groups',
        //   start: '13:20',
        //   end: '14:30',
        // },
      ],
      // Tuesday
      [
        {title: 'Welcome / SEL', start: '08:30'},
        {title: 'Writing', start: '09:00'},
        {title: 'Math', start: '09:45'},
        {title: 'Break', start: '10:30'},
        {title: 'PE - Seesaw', start: '11:00'},
        {title: 'Reading', start: '11:30'},
        {title: 'Lunch', start: '12:00'},
        {title: 'Science / Social Studies', start: '12:45', end: '13:15'},
        {
          title: 'Reading',
          start: '13:20',
          end: '13:50',
        },
        // {
        //   title: 'Independent Work / Small Groups',
        //   start: '13:55',
        //   end: '14:30',
        // },
      ],
      // Wednesday
      [
        {title: 'Welcome / SEL', start: '08:30'},
        {title: 'Writing', start: '09:00'},
        {title: 'Reading', start: '09:30'},
        {title: 'Independent Work / Small Groups', start: '10:00'},
        {title: 'Break', start: '10:30'},
        {title: 'PE - Seesaw', start: '11:00'},
        {title: 'Reading', start: '11:30'},
        {title: 'Lunch', start: '12:00', end: '12:45'},
        // {title: 'Community Meeting', start: '12:45', end: '13:15'},
        // {
        //   title: 'Independent Work / Small Groups',
        //   start: '13:15',
        //   end: '13:45',
        // },
      ],
      // Thursday
      [
        {title: 'Welcome / SEL', start: '08:30'},
        {title: 'Writing', start: '09:00'},
        {title: 'Math', start: '09:45'},
        {title: 'Break', start: '10:30'},
        {title: 'PE - Seesaw', start: '11:00'},
        {title: 'Reading', start: '11:30'},
        {title: 'Lunch', start: '12:00'},
        {title: 'Science / Social Studies', start: '12:45', end: '13:15'},
        {
          title: 'Reading',
          start: '13:20',
          end: '13:50',
        },
        // {
        //   title: 'Independent Work / Small Groups',
        //   start: '13:55',
        //   end: '14:30',
        // },
      ],
      // Friday
      [
        {title: 'Welcome / SEL', start: '08:30'},
        {title: 'Writing', start: '09:00'},
        {title: 'Math', start: '09:45'},
        {title: 'Break', start: '10:30'},
        {title: 'PE - Seesaw', start: '11:00'},
        {title: 'Reading', start: '11:30'},
        {title: 'Lunch', start: '12:00'},
        {title: 'Science / Social Studies', start: '12:45', end: '13:15'},
        // {
        //   title: 'Independent Work / Small Groups',
        //   start: '13:20',
        //   end: '14:30',
        // },
      ],
    ],
  },
  {
    name: 'Wellington',
    color: 'rgb(60 165 78)',
    eventsByDay: [
      // Monday
      [
        {title: 'Homeroom / Math / Science', start: '08:30'},
        {title: 'PE - Seesaw', start: '10:00'},
        {title: 'Break', start: '10:30'},
        {title: 'ELA', start: '11:00'},
        {title: 'Lunch', start: '12:00'},
        {title: 'Break', start: '12:45'},
        {title: 'Art or Music', start: '13:20', end: '13:50'},
        {title: 'Science', start: '14:00', end: '14:30'},
      ],
      // Tuesday
      [
        {title: 'Homeroom / Math / Science', start: '08:30'},
        {title: 'PE - Live', start: '10:00'},
        {title: 'Break', start: '10:30'},
        {title: 'ELA', start: '11:00'},
        {title: 'Lunch', start: '12:00'},
        {title: 'Break', start: '12:45'},
        {title: 'Small Groups', start: '13:10'},
        {title: 'Break', start: '13:30'},
        {title: 'Science', start: '14:00', end: '14:30'},
      ],
      // Wednesday
      [
        {title: 'Homeroom / Math / Science', start: '08:30'},
        {title: 'PE - Seesaw', start: '10:00'},
        {title: 'Break', start: '10:30'},
        {title: 'ELA', start: '11:00'},
        {title: 'Lunch', start: '12:00', end: '12:45'},
        // {title: 'Community Meeting', start: '12:45', end: '13:15'},
      ],
      // Thursday
      [
        {title: 'Homeroom / Math / Science', start: '08:30'},
        {title: 'PE - Seesaw', start: '10:00'},
        {title: 'Break', start: '10:30'},
        {title: 'ELA', start: '11:00'},
        {title: 'Lunch', start: '12:00'},
        {title: 'Break', start: '12:45'},
        {title: 'Art or Music', start: '13:20', end: '13:50'},
        {title: 'Social Studies', start: '14:00', end: '14:30'},
      ],
      // Friday
      [
        {title: 'Homeroom / Math / Science', start: '08:30'},
        {title: 'PE - Seesaw', start: '10:00'},
        {title: 'Break', start: '10:30'},
        {title: 'ELA', start: '11:00'},
        {title: 'Lunch', start: '12:00'},
        {title: 'Break', start: '12:45'},
        {title: 'Social Studies', start: '13:10'},
        {title: 'Break', start: '13:30'},
        {title: 'Social Studies', start: '14:00', end: '14:30'},
      ],
    ],
  },
];

const CALENDARS = CALENDARS_RAW.map(cal => ({
  ...cal,
  eventsByDay: cal.eventsByDay.map(events =>
    events.map((ev, i) => {
      const end = ev.end ?? events[i + 1]?.start ?? '14:30';
      const lower = ev.title.toLowerCase();
      let color = ev.color;
      let opacity = 1;
      if (['break', 'lunch'].includes(lower)) {
        color = '#999';
        opacity = 0.6;
      }
      if (lower.includes('independent') || lower.includes('seesaw')) {
        opacity = 0.6;
      }
      return {
        ...ev,
        color,
        opacity,
        start: Temporal.Time.from(ev.start),
        end: Temporal.Time.from(end),
      };
    }),
  ),
}));

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: 'numeric',
  timeZone: Temporal.now.timeZone(),
});

function App() {
  const [currentTime, setCurrentTime] = useState(Temporal.now.time());
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentTime(Temporal.now.time());
    }, 1000 * 60);
    return () => clearInterval(id);
  }, []);

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
        margin: 40px 40px 40px 80px;
        width: calc(100vw - 120px);
        grid-template-columns: auto;
        grid-template-rows: auto;
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
            transform: translateY(-3px);
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

      {CALENDARS.map((cal, calIndex) => [
        <h1
          className={css`
            font-size: 120%;
            margin: 0 0 16px 8px;
          `}
          key={`calendar-${calIndex}-label`}
          style={{
            gridColumn: calIndex + 2,
            gridRow: 1,
          }}>
          {cal.name}
        </h1>,
        (cal.eventsByDay[Temporal.now.date().dayOfWeek - 1] ?? []).map(
          (ev, evIndex) => {
            let background = ev.color || cal.color || 'rgb(63, 81, 181)';
            return (
              <div
                className={css`
                  border-radius: 4px;
                  color: white;
                  padding: 4px;
                  margin-bottom: 2px;
                  margin-left: 8px;
                `}
                key={`calendar-${calIndex}_event-${evIndex}`}
                style={{
                  background,
                  gridColumn: calIndex + 2,
                  gridRowStart: toGridRow(ev.start),
                  gridRowEnd: toGridRow(ev.end),
                  opacity: ev.opacity,
                }}>
                {ev.title}
              </div>
            );
          },
        ),
      ])}
      {Temporal.Time.compare(currentTime, START_TIME) >= 0 && (
        <div
          className={css`
            border-top: solid 2px red;
            position: relative;
          `}
          style={{
            gridColumnStart: 1,
            gridColumnEnd: CALENDARS.length + 2,
            gridRow: toGridRow(currentTime),
          }}>
          <div
            className={css`
              color: red;
              position: absolute;
              right: calc(100% + 4px);
              top: -11px;
              white-space: nowrap;
            `}>
            {timeFormatter.format(currentTime)}
          </div>
        </div>
      )}
    </div>
  );
}

function toGridRow(time) {
  return (
    Math.floor(
      time.difference(START_TIME, {largestUnit: 'minutes'}).minutes / 5,
    ) +
    1 +
    // Add an extra for the header
    1
  );
}

// eslint-disable-next-line no-unused-vars
function log(value) {
  console.log(value);
  return value;
}

export default App;
