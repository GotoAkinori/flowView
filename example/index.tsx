import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { LinkView } from '../src/index';
import { randomData } from './randomData';

const data_groups = require('./groups.json');
const data_style = require('./style.json');

const App = () => {
  let linkView: React.RefObject<LinkView> = React.createRef<LinkView>();

  let [groups, styles] = randomData(3, 150);

  return (
    <div className="top">
      <LinkView
        ref={linkView}
        // data={data_groups}
        // style={data_style}
        data={groups}
        style={styles}
        event={{
          onClickLeft: (groupId, itemId) => {
            console.log(`onClickLeft ${groupId} ${itemId}`);
          },
          onClickRight: (groupId, itemId) => {
            console.log(`onClickRight ${groupId} ${itemId}`);
          },
          onClickBody: (groupId, itemId) => {
            linkView.current?.clearHighlight();
            linkView.current?.setHighlight(groupId, itemId);
          },
          onClickBack: () => {
            linkView.current!.clearHighlight();
          },
        }}
      />
    </div>
  );
};

// const root = createRoot(document.getElementById("root")!);
// root.render(<App />);

ReactDOM.render(<App />, document.getElementById('root')!);
