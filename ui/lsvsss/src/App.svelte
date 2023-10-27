<script lang="ts">
  const uuid = loadUUID();
  const width = Math.random();

  type Category = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

  let done = false;

  function loadUUID() {
    let uuid = localStorage.getItem('uuid');
    if (!uuid) {
      uuid = '' + Math.random() + '' + Math.random();
      localStorage.setItem('uuid', uuid);
    }
    return uuid;
  }

  function widthToCategory(width: number): Category {
    if (width <= 0.0 || width > 4) {
      throw new Error('Invalid width ' + JSON.stringify(width));
    }
    return '0123456789ABCDEF'[Math.floor(width * 4)] as Category;
  }
  
  const thisIsALine = async () => {
    if (done) return;
    const classification = 'L';
    await fetch('https://lvs.cochleoid.com/vote', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uuid,
        category: widthToCategory(width),
        classification,
      }),
    })
    done = true;
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const thisIsAStrip = async () => {
    if (done) return;
    const classification = 'S';
    await fetch('https://lvs.cochleoid.com/vote', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uuid,
        category: widthToCategory(width),
        classification,
      }),
    })
    done = true;
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };
</script>

<main>
  <h1>What is this?</h1>

  <div style={"height: " + width + "cm; background: black; width: 100vh;"}>
    &nbsp;
  </div>

  <div class="card">
    <button on:click={thisIsALine}>This is a line.</button>
    <button on:click={thisIsAStrip}>This is a strip.</button>
  </div>
</main>
