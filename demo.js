
  Element.prototype.hide = function () {
    this.className += ' hide';
  }

  Element.prototype.show = function () {
    this.className = this.className.replace(' hide', '');
  }

  function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  const wax = new waxjs.WaxJS({
    rpcEndpoint: 'https://testnet.wax.pink.gg',
    waxSigningURL: 'https://all-access.waxtest.net'
  });

  const prependTextLog = function(text) {
    const logPanelEle = document.getElementById('logPanel');
    const hasChild = logPanelEle.children.length > 0;
    let logEle = document.createElement('p')
    logEle.innerHTML = `${new Date().toLocaleString()} - ${text}`;
    if(hasChild) logPanelEle.insertBefore(logEle, logPanelEle.children[0]);
    else logPanelEle.appendChild(logEle);

    return logEle;
  }

  const prependTrace = function(trace, refEle) {
    const formatter = new JSONFormatter(trace, 1, {
      hoverPreviewEnabled: true,
      animateOpen: false,
      animateClose: false,
      useToJSON: true
    });

    insertAfter(refEle, formatter.render());
  }

  async function loginWAX() {
    try {
      const userAccount = await wax.login();

      document.getElementById('updater').value = userAccount;
      document.getElementById('loginBtn').innerHTML = userAccount;
      document.getElementById('loginBtn2').hide();
      document.getElementById('testform').show();
      document.getElementById('message').value = Math.random().toString(36).substring(2);
      prependTextLog(`✔ Login as <a href="https://testnet.waxblock.io/account/${userAccount}" target="_blank" title="View account on testnet.waxblock.io"><i><strong>${userAccount}</strong></i></a>`);
    } catch(e) {
      prependTextLog(`❌ ${e.message}`);
    }
  }

  async function signTransaction() {
    if(!wax.api) return;

    const updater = document.getElementById('updater').value;
    const message = document.getElementById('message').value;

    try {
      // const result = await wax.api.transact({
      //   actions: [{
      //     account: 'eosio',
      //     name: 'setabi',
      //     authorization: [{
      //       actor: wax.userAccount,
      //       permission: 'active',
      //     }],
      //     data: { account: wax.userAccount, abi: "" },
      //   }]
      // }, {
      //   blocksBehind: 3,
      //   expireSeconds: 30
      // });
      const result = await wax.api.transact({
        actions: [{
          account: 'test.waxtn',
          name: 'update',
          authorization: [{
            actor: wax.userAccount,
            permission: 'active',
          }],
          data: {
            updater,
            message,
            fail: false,
          },
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 240
      });
      const {transaction_id, processed: traces} = result;
      const refEle = prependTextLog(`✔ Success <a href="https://testnet.waxblock.io/transaction/${transaction_id}" target="_blank" title="View transaction on testnet.waxblock.io"><strong>${transaction_id}</strong></i></a>`);
      prependTrace(traces, refEle);
      document.getElementById('message').value = Math.random().toString(36).substring(2);
      // console.log('result', result);
    } catch(e) {
      prependTextLog(`❌ ${e.message}`);
    }
  }