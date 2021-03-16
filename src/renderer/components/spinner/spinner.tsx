import "./spinner.scss";

import React from "react";
import { cssNames } from "../../utils";

export interface SpinnerProps extends React.HTMLProps<any> {
  singleColor?: boolean;
  center?: boolean;
  centerHorizontal?: boolean;
  requireVisible?: boolean;
}

export class Spinner extends React.Component<SpinnerProps, {}> {
  static defaultProps = {
    singleColor: true,
    center: false,
    centerHorizontal: false,
    requireVisible: false,
  };

  render() {
    const { center, singleColor, centerHorizontal, requireVisible, className, ...props } = this.props;
    const classNames = cssNames("Spinner", className, { singleColor, center, centerHorizontal, requireVisible });

    return <div {...props} className={classNames} />;
  }
}
