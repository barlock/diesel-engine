# Diesel (Slack Bot Workflow Engine)
Diesel aims to make slack bot development easy. Diesel's aim is to act as a flow engine separating view, state, and state progressions into a neat little package. 

## Concepts
A **flow** is a set of messages and actions that can start, end, or progress a flow. A progression is an instance of a particular flow. Flows need at least one message or one action

**Messages** are representations of Slack messages and interactive messages. Message representations are “rendered” statically, meaning, given the _state_ of a progression and a triggering _action_ if it exists, the message (JSON) can be built. Messages and message partials should be componentidzed and templitized. You should be able to build a “view” of a message that can have multiple versions depending on the state like someone clicking an “approve” button. And you should be able to dynamically inject things like _who_ approved it.

**Actions** are Slack events (events api) slack interactive components (buttons, dialogs, message menu loads), slash commands, or something custom. Action Handlers can handle one or more types of actions and mutate the state, and then progress a progression to one or more messages.

A flow should be package able and call-able as a “sub-flow”. Multiple sub-flows can be triggered and brought back together (with “and” and “or” like behavior).

### Action Handlers
Handlers accept an `action` and a `state` (think redux) and mutate the state returning it or a `promise` for one. Progressions can take multiple action handlers per event like middleware


## TO_DO:
- [ ] How do you handle errors? Remediation step?
- [ ] Is it worth checking if a state transition is valid?
