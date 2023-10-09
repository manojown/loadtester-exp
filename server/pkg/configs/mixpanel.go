package configs

import (
	"context"
	"fmt"
	"os"

	"github.com/mixpanel/mixpanel-go"
)

type MixpanelConfig struct {
	Client *mixpanel.ApiClient
}

var Mixpanel *MixpanelConfig

func MixpanelInitialize() *MixpanelConfig {
	Mixpanel = &MixpanelConfig{
		Client: mixpanel.NewApiClient(os.Getenv("MIXPANEL")),
	}
	return Mixpanel
}

func (mp *MixpanelConfig) SendEvent(event string, data map[string]any) {
	ctx := context.Background()
	if err := mp.Client.Track(ctx, []*mixpanel.Event{
		mp.Client.NewEvent(event, mixpanel.EmptyDistinctID, data),
	}); err != nil {
		fmt.Println("Error while sending event to mixpanel: ", err)
	}
}
