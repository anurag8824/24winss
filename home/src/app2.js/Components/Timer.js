import React from 'react'

const Timer = () => {
const [counter, setCounter] = React.useState(120);
120);

React.useEffect(() => {
    const timer = counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
    return () => clearInterval(timer);
  }, [counter]);

  return (
    <div className="App">
      <div className='badge bg-secondary'>Countdown:{counter}sec.</div>
    </div>
  );
   
  
}

export default Timer