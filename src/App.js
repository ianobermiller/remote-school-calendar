import {css} from 'emotion';
import {Temporal} from 'proposal-temporal';
import React, {useEffect, useState} from 'react';
import {FaCompress, FaExpand} from 'react-icons/fa';
import {CALENDAR_DATA} from './CalendarData';
import createSilentAudio from './createSilentAudio';

const audioSrc = createSilentAudio(10);

const START_TIME = Temporal.Time.from({hour: 8, minute: 30});
const END_TIME = Temporal.Time.from({hour: 14, minute: 30});
const LABEL_STEP = Temporal.Duration.from({minutes: 30});

const CALENDARS = CALENDAR_DATA.map(cal => ({
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

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const rows = [];
  let current = START_TIME;
  while (Temporal.Time.compare(current, END_TIME) <= 0) {
    rows.push(current);
    current = current.plus(LABEL_STEP);
  }

  return (
    <div
      className={css`
        background: white;
        display: grid;
        height: calc(100vh - 80px);
        margin: 40px 40px 40px 120px;
        width: calc(100vw - 160px);
        grid-template-columns: auto;
        grid-template-rows: auto;
        grid-auto-rows: minmax(0, 1fr);
        grid-auto-columns: minmax(0, 1fr);
      `}>
      {rows.map((t, i) => (
        <TimeRow key={`label-${t.toString()}`} time={t} />
      ))}

      {CALENDARS.map((cal, calIndex) => (
        <CalendarHeader
          calendar={cal}
          index={calIndex}
          key={`calendar-${calIndex}-label`}
        />
      ))}

      {CALENDARS.map((cal, calIndex) =>
        (
          cal.eventsByDay[Temporal.now.date().dayOfWeek - 1] ?? []
        ).map((ev, evIndex) => (
          <CalendarEvent
            calendar={cal}
            calendarIndex={calIndex}
            event={ev}
            key={`calendar-${calIndex}_event-${evIndex}`}
          />
        )),
      )}

      <CurrentTimeIndicator currentTime={currentTime} />

      {isPlayingAudio && (
        <audio autoPlay={true} controls={false} loop={true} src={audioSrc} />
      )}

      <div
        className={css`
          cursor: pointer;
          padding: 12px;
          position: fixed;
          right: 0;
          top: 0;
        `}>
        {isPlayingAudio ? (
          <FaCompress
            color="#aaa"
            onClick={() => {
              setIsPlayingAudio(false);
              document.exitFullscreen();
            }}
          />
        ) : (
          <FaExpand
            color="#aaa"
            onClick={() => {
              setIsPlayingAudio(true);
              document.body.firstElementChild.requestFullscreen();
            }}
          />
        )}
      </div>
    </div>
  );
}

function TimeRow({time}) {
  return (
    <>
      <div
        className={css`
          color: #666;
          font-size: 80%;
          padding-right: 8px;
          text-align: right;
          transform: translateY(-6px);
        `}
        style={{
          gridColumn: 1,
          gridRow: toGridRow(time),
        }}>
        {timeFormatter.format(time)}
      </div>
      <div
        className={css`
          border-top: solid 1px #ccc;
        `}
        style={{
          gridColumnStart: 2,
          gridColumnEnd: CALENDARS.length + 2,
          gridRow: toGridRow(time),
        }}
      />
    </>
  );
}

function CalendarEvent({event, calendar, calendarIndex}) {
  let background = event.color || calendar.color || 'rgb(63, 81, 181)';
  return (
    <div
      className={css`
        border-radius: 4px;
        color: white;
        padding: 4px;
        margin-bottom: 2px;
        margin-left: 8px;
      `}
      style={{
        background,
        gridColumn: calendarIndex + 2,
        gridRowStart: toGridRow(event.start),
        gridRowEnd: toGridRow(event.end),
        opacity: event.opacity,
      }}>
      {event.title}
    </div>
  );
}

function CalendarHeader({index, calendar}) {
  return (
    <h1
      className={css`
        font-size: 120%;
        margin: 0 0 16px 8px;
      `}
      style={{
        gridColumn: index + 2,
        gridRow: 1,
      }}>
      {calendar.name}
    </h1>
  );
}

function CurrentTimeIndicator({currentTime}) {
  if (
    Temporal.Time.compare(currentTime, START_TIME) < 0 ||
    Temporal.Time.compare(currentTime, END_TIME) > 0
  ) {
    return null;
  }

  return (
    <div
      className={css`
        border-top: solid 4px red;
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
          font-weight: bold;
          position: absolute;
          right: calc(100% + 4px);
          top: -16px;
          white-space: nowrap;
        `}>
        {timeFormatter.format(currentTime)}
      </div>
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
