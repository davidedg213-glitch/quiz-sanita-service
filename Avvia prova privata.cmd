@echo off
title Preparati - Prova privata
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\avvia-prova.ps1"
if errorlevel 1 pause
