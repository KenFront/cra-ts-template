import { Global } from '@emotion/react/macro';
import Todos from './Todo/Todos';
import style from './Style';

function App() {
  return (
    <>
      <Global styles={style} />
      <Todos />
    </>
  );
}

export default App;
