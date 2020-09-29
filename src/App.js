import {css} from 'emotion';
import {Temporal} from 'proposal-temporal';
import React, {useEffect, useState} from 'react';
import {
  FaAngleLeft as LeftIcon,
  FaAngleRight as RightIcon,
  FaCompress as CompressIcon,
  FaExpand as ExpandIcon,
} from 'react-icons/fa';
import {CALENDAR_DATA} from './CalendarData';
import createSilentAudio from './createSilentAudio';

// Play silent audio so that Portal will not turn on the screensaver
const audioSrc = createSilentAudio(10);

const START_TIME = Temporal.Time.from({hour: 8, minute: 30});
const END_TIME = Temporal.Time.from({hour: 14, minute: 30});
const LABEL_STEP = Temporal.Duration.from({minutes: 30});

const SMALL_SCREEN = '(max-width: 400px)';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'numeric',
  day: 'numeric',
  timeZone: Temporal.now.timeZone(),
});

const CALENDARS = CALENDAR_DATA.map(cal => ({
  ...cal,
  eventsByDay: cal.eventsByDay.map((events, dayIndex) =>
    events.map((ev, i) => {
      const end = ev.end ?? events[i + 1]?.start;
      if (!end) {
        throw new Error(
          `Missing end time for last event "${ev.title}" on day ${dayIndex} in "${cal.name}"`,
        );
      }

      const lower = ev.title.toLowerCase();
      let color = ev.color;
      let opacity = 1;
      if (['break', 'lunch'].includes(lower)) {
        color = '#999';
        opacity = 0.6;
      }
      if (
        ['independent', 'seesaw', 'office'].some(term => lower.includes(term))
      ) {
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
  const [currentDateTime, setCurrentDateTime] = useState(
    Temporal.now.dateTime(),
  );
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentDateTime(previous => {
        // Only increment the time if we are on the current day
        const newDateTime = Temporal.now.dateTime();
        if (previous.toDate().equals(newDateTime.toDate())) {
          return newDateTime;
        }
        return previous;
      });
    }, 1000 * 10);
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
        height: 100vh;
        max-height: -webkit-fill-available;
        padding: 20px;
        width: 100vw;
        grid-template-columns: auto;
        grid-template-rows: auto;
        grid-auto-rows: minmax(0, 1fr);
        grid-auto-columns: minmax(0, 1fr);

        @media ${SMALL_SCREEN} {
          padding: 10px;
        }
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
          cal.eventsByDay[currentDateTime.dayOfWeek - 1] ?? []
        ).map((ev, evIndex) => (
          <CalendarEvent
            calendar={cal}
            calendarIndex={calIndex}
            event={ev}
            key={`calendar-${calIndex}_event-${evIndex}`}
          />
        )),
      )}

      <DatePicker
        currentDateTime={currentDateTime}
        setCurrentDateTime={setCurrentDateTime}
      />

      <CurrentTimeIndicator currentDateTime={currentDateTime} />

      {isPlayingAudio && (
        <audio autoPlay={true} controls={false} loop={true} src={audioSrc} />
      )}

      {document.exitFullscreen && (
        <div
          className={css`
            cursor: pointer;
            font-size: 40px;
            padding: 12px;
            position: fixed;
            right: 0;
            top: 0;
          `}>
          {isPlayingAudio ? (
            <CompressIcon
              color="#aaa"
              onClick={() => {
                setIsPlayingAudio(false);
                document.exitFullscreen();
              }}
            />
          ) : (
            <ExpandIcon
              color="#aaa"
              onClick={() => {
                setIsPlayingAudio(true);
                document.body.firstElementChild.requestFullscreen();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function TimeRow({time}) {
  return (
    <>
      <div
        className={css`
          color: #666;
          font-size: 18px;
          padding-right: 8px;
          text-align: right;
          transform: translateY(-6px);

          @media ${SMALL_SCREEN} {
            font-size: 10px;
            width: 30px;
          }
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
        font-size: 44px;
        padding: 4px;
        margin-bottom: 2px;
        margin-left: 8px;

        @media ${SMALL_SCREEN} {
          font-size: 16px;
        }
      `}
      onClick={() => {
        if ('speechSynthesis' in window) {
          const msg = new SpeechSynthesisUtterance();
          msg.text = event.title;
          window.speechSynthesis.speak(msg);
        }
      }}
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
        font-size: 32px;
        margin: 0 0 0 8px;
        text-align: center;
      `}
      style={{
        gridColumn: index + 2,
        gridRow: 1,
      }}>
      {calendar.name}
    </h1>
  );
}

function DatePicker({currentDateTime, setCurrentDateTime}) {
  const buttonStyle = css`
    border: none;
    background: none;
    color: inherit;
    cursor: pointer;
    padding: 10px 4px 4px 4px;
  `;
  return (
    <div
      className={css`
        color: #666;
        display: flex;
        font-size: 18px;
        left: 50%;
        position: fixed;
        top: 0;
        transform: translateX(-50%);
        align-items: center;
      `}>
      <button
        className={buttonStyle}
        onClick={() => {
          setCurrentDateTime(d => d.minus({days: 1}));
        }}>
        <LeftIcon size="1.3em" />
      </button>
      <div
        className={css`
          text-align: center;
          width: 160px;
        `}>
        {dateFormatter.format(currentDateTime)}
      </div>
      <button
        className={buttonStyle}
        onClick={() => {
          setCurrentDateTime(d => d.plus({days: 1}));
        }}>
        <RightIcon size="1.3em" />
      </button>
    </div>
  );
}

function CurrentTimeIndicator({currentDateTime}) {
  const time = currentDateTime.toTime();
  if (
    Temporal.Time.compare(time, START_TIME) < 0 ||
    Temporal.Time.compare(time, END_TIME) > 0
  ) {
    return null;
  }

  return (
    <div
      className={css`
        border-top: solid 4px red;
        grid-column-start: 1;
        position: relative;

        @media ${SMALL_SCREEN} {
          border-top: solid 2px red;
        }
      `}
      style={{
        gridColumnEnd: CALENDARS.length + 2,
        gridRow: toGridRow(currentDateTime.toTime()),
      }}>
      <div
        className={css`
          background: red;
          color: white;
          font-size: 24px;
          white-space: nowrap;
          padding: 0 4px;
          position: absolute;
          top: -28px;
          left: -20px;

          @media ${SMALL_SCREEN} {
            font-size: 12px;
            left: -6px;
            top: -15px;
          }
        `}>
        {timeFormatter.format(currentDateTime)}
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
