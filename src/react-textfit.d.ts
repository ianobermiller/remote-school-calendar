declare module 'react-textfit' {
  interface Props extends React.HTMLProps<HTMLDivElement> {
    /** When mode is single and forceSingleModeWidth is true, the element's height will be ignored. Default is `true`. */
    forceSingleModeWidth?: boolean;
    /** Algorithm to fit the text. Use single for headlines and multi for paragraphs. Default is `multi`. */
    mode?: 'single' | 'multi';
    /** Minimum font size in pixel. Default is `1`. */
    min?: number;
    /** Maximum font size in pixel. Default is `100`. */
    max?: number;
    /** Window resize throttle in milliseconds. Default is `50`. */
    throttle?: number;
    /** Will be called when text is fitted. */
    onReady?: () => void;
  }

  export function Textfit(props: Props): ReactElement;
}
