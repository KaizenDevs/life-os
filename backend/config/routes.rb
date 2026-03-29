Rails.application.routes.draw do
  devise_for :users, controllers: { sessions: "users/sessions" }

  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      resources :providers do
        member do
          post :archive
          post :unarchive
        end
      end

      resources :groups do
        resources :memberships, only: [:index, :create, :update, :destroy] do
          member do
            post :accept
          end
        end
      end
    end
  end
end
