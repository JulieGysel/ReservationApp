import React from 'react';

export enum EditMode {
  Toggle,
  Set,
  Clear,
}

export class Cell extends React.Component {
  state = {
    enabled: false,
    hover: false,
    up: false,
    down: false,
    text: '',
    isBottom: false,
    borders: [true, true, true, true], // top right bottom left
  };

  hover = false;
  enabled = false;

  width = '';
  height = '';
  borderStyle = '';
  id = '';

  constructor(props: any) {
    super(props);

    this.width = props['data-width'].toString() + '%';
    this.height = props['data-height'].toString() + '%';
    this.id = props['data-id'];
    this.state.borders = props['data-borders'];

    this.borderStyle =
      '1px ' + (props['data-dotted'] === true ? 'dotted' : 'solid') + ' var(--surface-border)';
  }

  public modify(mode: EditMode) {
    let enabled = !this.state.enabled;
    if (mode == EditMode.Clear) {
      enabled = false;
    } else if (mode == EditMode.Set) {
      enabled = true;
    }
    this.enabled = enabled;
    this.setState({ enabled: enabled });
  }

  public clear() {
    this.enabled = false;
    this.hover = false;
    this.modify(EditMode.Clear);
    this.setState({ enabled: false, hover: false, ghost: false, text: '' });
  }

  public setNeighbors(up: any, down: any) {
    this.state.isBottom = this.enabled && !down;
    // if (this.enabled && (!up || !down)) {
    //   this.state.cursor = 'grab';
    // } else {
    //   this.state.cursor = 'auto';
    // }
    this.setState({ up: up, down: down });
  }

  public setHover(value: any) {
    this.hover = value;
    this.setState({ hover: value });
  }

  public isEnabled() {
    return this.state.hover || this.state.enabled;
  }

  public render() {
    let style = {
      // width: this.width,
      width: '100%',
      height: this.height,
      cursor: 'pointer',
      // borderLeft: this.state.borders[3] ? '1px solid var(--line-color)' : 'none',
    };
    let borderUp = this.state.up ? '0px' : '5px';
    let borderDown = this.state.down ? '0px' : '5px';

    let visible = this.state.enabled || this.state.hover;
    return (
      <div className="cell no-highlights" style={style}>
        {this.state.isBottom && (
          <div
            style={{
              zIndex: 3,
              width: 'calc(100% - 5px)',
              top: '50%',
              height: '50%',
              position: 'absolute',
              cursor: 'ns-resize',
            }}
          ></div>
        )}
        {/* 
        {this.state.enabled && !this.state.up && (
          <div
            className="handle"
            style={{
              position: 'absolute',
              zIndex: 3,
              left: 'calc(85% - 5px)',
              top: '-6px',
            }}
          ></div>
        )} */}

        {/* <div style={{ marginLeft: '5px' }}>
          {(this.state.enabled ? 'E' : ' ') +
            (this.state.hover ? 'H' : ' ') +
            +this.state.text +
            (this.state.up ? '1' : '0') +
            (this.state.down ? '1' : '0')}
        </div> */}

        {/*<div className={'text' + ghost}>{this.state.text}</div>*/}
        {false && visible && (
          <div
            className={'frame'}
            style={{
              // backgroundColor: 'transparent',
              // borderTop: this.state.up ? 'none' : border,
              // borderBottom: this.state.down ? 'none' : border,
              // borderLeft: border,
              // borderRight: border,
              visibility: visible ? 'visible' : 'hidden',
              borderTopLeftRadius: borderUp,
              borderTopRightRadius: borderUp,
              borderBottomRightRadius: borderDown,
              borderBottomLeftRadius: borderDown,
            }}
          ></div>
        )}
        <div
          className="horizontal-border"
          style={{
            borderTop: this.state.borders[0] ? this.borderStyle : 'none',
          }}
        ></div>
      </div>
    );
  }
}
