// @flow
import React from 'react';

export default function HighlightValue(props) {
  if (props.search) {
    return (
      <span dangerouslySetInnerHTML={{
        __html: props.value.replace(props.search, (str) => `<span class="highlight">${str}</span>`)
      }}
      />
    );
  }

  return <span>{props.value}</span>;
}
