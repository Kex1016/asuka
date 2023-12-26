{ pkgs ? import <nixpkgs> {} }:
  pkgs.mkShell {
    nativeBuildInputs = with pkgs.buildPackages; [
        nodejs_21
        nodePackages.http-server
	bun
    ];
    shellHook = ''
    clear
    '';
}
