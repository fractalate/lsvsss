<script lang="ts">
  const uuid = loadUUID();
  const width = randomFromZeroToJustBeforeOne();

  function randomFromZeroToJustBeforeOne() {
    const result = Math.random();
    return result == 0 ? 1 : result;
  }

  type Category = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

  let working = false;
  let thanks = false;

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
    if (working) return;
    working = true;
    const classification = 'L';
    try {
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
    } finally {
      thanks = true;
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  const thisIsAStrip = async () => {
    if (working) return;
    working = true;
    const classification = 'S';
    try {
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
    } finally {
      thanks = true;
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };
</script>

<main>
  <h1>What is this?</h1>

  <div style={"height: " + width + "cm; background: var(--the-color); width: calc(100vw - 7rem);"}>
    &nbsp;
  </div>

  <div class="card">
    {#if thanks}
      <button disabled>Thanks!</button>
    {:else}
      <button on:click={thisIsALine}>This is a line.</button>
      <button on:click={thisIsAStrip}>This is a strip.</button>
    {/if}
  </div>
</main>
