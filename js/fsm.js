class FSM {
  constructor(initialState) {
    this.state = initialState;
    this.states = {};
  }

  addState(name, state) {
    this.states[name] = state;
  }

  changeState(newState, owner) {
    if (this.state === newState) return;

    const oldState = this.states[this.state];
    if (oldState && oldState.exit) oldState.exit(owner);

    this.state = newState;

    const nextState = this.states[this.state];
    if (nextState && nextState.enter) nextState.enter(owner);
  }

  update(owner, deltaTime) {
    const currentState = this.states[this.state];

    if (currentState && currentState.update) {
      currentState.update(owner, this, deltaTime);
    }
  }
}
