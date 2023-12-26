import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
  event: 'ready',
  once: true,
})
export class UserEvent extends Listener {
	public override run() {
    console.log('Ready! Logged in as ', this.container.client.user?.tag ?? 'unknown user');
  }
}
