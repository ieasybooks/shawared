# Playback

There is one player for the whole app, `apps/app/src/features/player/player.ts`. Screens talk to it through `usePoemPlayback` (`features/listening/playback.ts`); the mini player reads it directly.

## The queue

When a poem ends, the next one plays. "Next" is the next poem in the list the reader opened the poem from: the home page (as its search showed it), a poet's, a reciter's or a meter's poems. A poem opened any other way (a shared link, the address bar, the mini player) plays on in the home page's order. `queue.ts` keeps the rules; list rows remember their list when pressed (`PoemCard`, `PoemRow`).

The catalog names every recording's audio key, so the player can queue a poem before its bundle is loaded. Poems whose recording the catalog doesn't name, as in an older copy of it, are left out of the queue.

The ∞ button at the end of the player's controls, repeat's counterpart, turns this off: the poem then stops at its end. The choice is kept on the device (`shawared.player.v1`). Repeat, while on, keeps the poem from ending.

When the queue moves on while the poem's page is in front, the page moves to the next poem. Elsewhere, only the mini player changes.

## Under the player

The player holds a playlist of the poem playing and the ones on either side of it, and fills it as it moves: one more after it as it starts each poem, one more before it when it reaches the first. The system moves from one recording to the next by itself, so a poem follows another with the screen locked and no JavaScript in between.

- **iOS and Android** (`playlist.ts`): expo-audio's `AudioPlaylist`. Only a playlist gets the lock screen's previous and next buttons; a single `AudioPlayer`'s are always off. The audio session plays with the ringer off and in the background, and is `doNotMixPersistent`: lock-screen controls need a mode that doesn't mix, and another app's audio that we paused doesn't start again by itself.
- **The web** (`playlist.web.ts`): one `<audio>` element for every recording, since Safari on iOS lets an element play without a tap only once a tap has started it, and the Media Session for lock screens, notifications and media keys.

The lock screen, the media notification and the browser show the poem's title, the poet and who recites it ("poet · إلقاء reciter"), شوارد, and the mark (`apps/app/public/artwork.png`, drawn by `scripts/app-icons.ts`; apps load it from shawared.com, dev builds from the dev server). Play and pause, the scrubber, and previous and next when there is a poem that way. iOS changes those two buttons as the queue moves. Android keeps the ones its playlist started with, since changing them builds its media session again, which could let the playback service out of the foreground in the background.

expo-audio handles the rest natively, for both its players and its playlists:

- iOS pauses for a call, an alarm or Siri, and plays on if the system says it should when they end. Another app's music pauses it for good. Unplugged headphones pause it.
- Android pauses for a call and plays on after it; another app's music pauses it for good. Headphones coming out pause it (`setHandleAudioBecomingNoisy`).
- Headset and Bluetooth buttons, Control Center and the lock screen reach the playlist through `MPRemoteCommandCenter` on iOS and the Media3 session on Android: play, pause, next and previous move the playlist, and the player follows its status.
- Android stops background audio after about three minutes unless lock-screen controls are on. They're on from the moment a poem plays until the mini player is closed.

Statuses arrive four times a second, in the background too, where frames don't: the player keeps the clock and repeat going from them, and catches up when the app comes back.

## What only a device can show

The browser tests (`tests/playback.spec.ts`) cover continuous play and the Media Session on the web. Native playback was last checked on an Android emulator before the playlist, so everything below needs a phone.

Test on iOS with a build of the app, not Expo Go. Expo Go from the App Store can't play in the background: Expo removes iOS's audio background mode from it before they publish it, so iOS freezes it when the phone locks (the poem stops, and the lock screen's play does nothing). A build gets the mode from expo-audio's plugin in `app.json`. On a Mac with Xcode and the phone paired, `bunx expo run:ios --configuration Release --device <udid>` in `apps/app` builds one that reads shawared.com and audio.shawared.com, as the store's does.

## Device checklist

Use a phone with the ringer off, and a poem list with a few poems in it.

1. **Background.** Play a poem from the home page and lock the phone. It keeps playing.
2. **Lock screen.** It shows the poem's title, "poet · إلقاء reciter", شوارد and the mark, with play/pause, a scrubber, and previous and next. Pause, play and scrub there, then unlock: the app shows the same state and the bayt at the new position.
3. **Next poem.** Scrub to near the end and wait. The next poem starts by itself, and the lock screen shows its title. Unlock: the poem's page moved to the next poem (or, from another page, the mini player shows it).
4. **Buttons.** Next and previous on the lock screen and in Control Center change the poem. On the list's last poem there is no next; on its first, no previous (Android keeps the buttons its playlist started with).
5. **The list it came from.** Open a poem from a poet's page and let it end: the poet's next poem plays, not the home page's.
6. **Autoplay off.** Turn ∞ off on a poem's page and let the poem end: it stops, and the lock screen offers no next. Close and reopen the app: ∞ is still off.
7. **Interruptions.** Call the phone while a poem plays: it pauses, and plays on after the call ends. Play music in another app: the poem pauses and stays paused.
8. **Headphones.** Pull out wired headphones or take out AirPods: it pauses. A single press or tap plays and pauses; a double, the next poem; a triple, the previous.
9. **Long background.** Leave it playing locked for ten minutes, across poems. It keeps going; reopen the app and it shows the right poem, position and state.
10. **Close.** Close the mini player: the lock screen's controls go away.
11. **The web on a phone.** In Safari or Chrome, play a poem and lock the phone: the lock screen shows it with the mark, and the next poem plays by itself.
